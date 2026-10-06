import { importPKCS8, SignJWT } from "jose";

type Json = Record<string, any>;
type CollectionName = "users" | "transactions" | "withdrawals";

const globalForFirestore = globalThis as unknown as {
  firestoreAccessToken?: { value: string; expiresAt: number };
};

function config() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase server configuration is missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY."
    );
  }

  return { projectId, clientEmail, privateKey };
}

async function accessToken() {
  const cached = globalForFirestore.firestoreAccessToken;
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value;

  const { clientEmail, privateKey } = config();
  const key = await importPKCS8(privateKey, "RS256");
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/datastore",
    aud: "https://oauth2.googleapis.com/token",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Firebase OAuth failed: ${await response.text()}`);
  }

  const data = await response.json();
  globalForFirestore.firestoreAccessToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in ?? 3600) * 1000,
  };
  return data.access_token as string;
}

function baseUrl() {
  const { projectId } = config();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;
}

async function firestore(path: string, init: RequestInit = {}) {
  const token = await accessToken();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Firestore request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

function encodeValue(value: any): any {
  if (value === null || value === undefined) return { nullValue: null };
  if (value instanceof Date) return { timestampValue: value.toISOString() };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value)
      ? { integerValue: String(value) }
      : { doubleValue: value };
  }
  if (typeof value === "string") return { stringValue: value };
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(encodeValue) } };
  }
  return {
    mapValue: {
      fields: Object.fromEntries(
        Object.entries(value).map(([key, val]) => [key, encodeValue(val)])
      ),
    },
  };
}

function decodeValue(value: any): any {
  if (!value) return null;
  if ("nullValue" in value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return new Date(value.timestampValue);
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  if ("mapValue" in value) return decodeFields(value.mapValue.fields ?? {});
  return null;
}

function decodeFields(fields: Record<string, any> = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeValue(value)])
  );
}

function encodeFields(data: Json) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, encodeValue(value)])
  );
}

function docIdFromName(name: string) {
  return name.split("/").pop()!;
}

function matchesWhere(row: any, where?: any): boolean {
  if (!where || Object.keys(where).length === 0) return true;
  if (where.OR) return where.OR.some((item: any) => matchesWhere(row, item));

  return Object.entries(where).every(([field, condition]: [string, any]) => {
    const value = row[field];

    if (condition && typeof condition === "object" && !Array.isArray(condition)) {
      if ("in" in condition) return condition.in.includes(value);
      if ("contains" in condition) {
        const source = String(value ?? "");
        const needle = String(condition.contains ?? "");
        return condition.mode === "insensitive"
          ? source.toLowerCase().includes(needle.toLowerCase())
          : source.includes(needle);
      }
      if ("equals" in condition) return value === condition.equals;
      if ("gte" in condition) return value >= condition.gte;
      if ("lte" in condition) return value <= condition.lte;
      if ("gt" in condition) return value > condition.gt;
      if ("lt" in condition) return value < condition.lt;
    }

    return value === condition;
  });
}

function applySelect(row: any, select?: Record<string, boolean>) {
  if (!select) return row;
  return Object.fromEntries(
    Object.entries(select)
      .filter(([, enabled]) => enabled)
      .map(([key]) => [key, row[key]])
  );
}

function sortRows(rows: any[], orderBy?: Record<string, "asc" | "desc">) {
  if (!orderBy) return rows;
  const [field, direction] = Object.entries(orderBy)[0] ?? [];
  if (!field) return rows;

  return [...rows].sort((a, b) => {
    const av = a[field] instanceof Date ? a[field].getTime() : a[field];
    const bv = b[field] instanceof Date ? b[field].getTime() : b[field];
    if (av === bv) return 0;
    const result = av > bv ? 1 : -1;
    return direction === "desc" ? -result : result;
  });
}

function applyMutation(data: any, current: any = {}) {
  const output = { ...current };

  for (const [key, raw] of Object.entries(data ?? {})) {
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      if ("increment" in raw) {
        output[key] =
          Number(output[key] ?? 0) + Number((raw as any).increment);
      } else if ("decrement" in raw) {
        output[key] =
          Number(output[key] ?? 0) - Number((raw as any).decrement);
      } else {
        output[key] = raw;
      }
    } else {
      output[key] = raw;
    }
  }

  output.updatedAt = new Date();
  return output;
}

async function getDocument(
  collection: CollectionName,
  id: string,
  transactionId?: string
) {
  if (transactionId) {
    const root = baseUrl().replace(/\/documents$/, "");
    const result = await firestore(":batchGet", {
      method: "POST",
      body: JSON.stringify({
        documents: [`${root}/documents/${collection}/${id}`],
        transaction: transactionId,
      }),
    });
    const found = result?.[0]?.found;
    return found ? { id, ...decodeFields(found.fields) } : null;
  }

  try {
    const doc = await firestore(
      `/${collection}/${encodeURIComponent(id)}`
    );
    return { id, ...decodeFields(doc.fields) };
  } catch (error: any) {
    if (String(error.message).includes("(404)")) return null;
    throw error;
  }
}

async function listDocuments(
  collection: CollectionName,
  transactionId?: string
) {
  const result = await firestore(":runQuery", {
    method: "POST",
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: collection }],
      },
      ...(transactionId ? { transaction: transactionId } : {}),
    }),
  });

  return (result ?? [])
    .filter((entry: any) => entry.document)
    .map((entry: any) => ({
      id: docIdFromName(entry.document.name),
      ...decodeFields(entry.document.fields),
    }));
}

async function withInclude(row: any, include?: any, select?: any) {
  let result = applySelect(row, select);

  if (include?.user && row.userId) {
    const user = await getDocument("users", row.userId);
    result = {
      ...result,
      user: user ? applySelect(user, include.user.select) : null,
    };
  }

  return result;
}

async function commitWrites(writes: any[], transaction?: string) {
  if (!writes.length) return;

  const merged = new Map<string, any>();
  for (const write of writes) {
    const key = `${write.collection}/${write.id}`;
    const previous = merged.get(key);
    merged.set(key, previous
      ? { ...write, type: previous.type === "create" ? "create" : write.type, data: { ...previous.data, ...write.data } }
      : write);
  }

  const documentWrites = [...merged.values()].map((write) => {
    const name = `${baseUrl()}/${write.collection}/${write.id}`;
    return write.type === "create"
      ? {
          update: { name, fields: encodeFields(write.data) },
          currentDocument: { exists: false },
        }
      : {
          update: { name, fields: encodeFields(write.data) },
        };
  });

  const body: any = { writes: documentWrites };
  if (transaction) body.transaction = transaction;

  return firestore(":commit", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

class TransactionClient {
  constructor(
    private readonly transactionId: string,
    private readonly writes: any[]
  ) {}

  user = this.collection("users");
  transaction = this.collection("transactions");
  withdrawal = this.collection("withdrawals");

  private collection(collection: CollectionName) {
    return {
      findUnique: async (args: any) => this.findUnique(collection, args),
      findFirst: async (args: any = {}) => this.findFirst(collection, args),
      findMany: async (args: any = {}) => this.findMany(collection, args),
      count: async (args: any = {}) => (await this.findMany(collection, args)).length,
      create: async (args: any) => this.create(collection, args),
      update: async (args: any) => this.update(collection, args),
    };
  }

  private async findUnique(collection: CollectionName, args: any) {
    const key = args.where?.id ? "id" : Object.keys(args.where ?? {})[0];
    const value = key ? args.where[key] : undefined;
    const row =
      key === "id"
        ? await getDocument(collection, value, this.transactionId)
        : (await listDocuments(collection, this.transactionId)).find(
            (item: any) => item[key] === value
          ) ?? null;

    return row ? applySelect(row, args.select) : null;
  }

  private async findFirst(collection: CollectionName, args: any = {}) {
    const rows = await this.findMany(collection, { ...args, take: 1 });
    return rows[0] ?? null;
  }

  private async findMany(collection: CollectionName, args: any = {}) {
    let rows = (await listDocuments(collection, this.transactionId)).filter(
      (row) => matchesWhere(row, args.where)
    );
    rows = sortRows(rows, args.orderBy);
    if (args.skip) rows = rows.slice(args.skip);
    if (args.take !== undefined) rows = rows.slice(0, args.take);
    return rows.map((row) => applySelect(row, args.select));
  }

  private async create(collection: CollectionName, args: any) {
    const id = args.data.id ?? crypto.randomUUID();
    const data = {
      ...args.data,
      id,
      createdAt: args.data.createdAt ?? new Date(),
      updatedAt: args.data.updatedAt ?? new Date(),
    };

    this.writes.push({ type: "create", collection, id, data });
    return data;
  }

  private async update(collection: CollectionName, args: any) {
    const id = args.where?.id;
    if (!id) throw new Error("Firebase compatibility layer requires update by id");

    const current = await getDocument(collection, id, this.transactionId);
    if (!current) throw new Error(`${collection} document not found`);

    const data = applyMutation(args.data, current);
    this.writes.push({ type: "update", collection, id, data });
    return data;
  }
}

function model(collection: CollectionName) {
  return {
    findUnique: async (args: any) => {
      const key = args.where?.id ? "id" : Object.keys(args.where ?? {})[0];
      const value = key ? args.where[key] : undefined;
      const row =
        key === "id"
          ? await getDocument(collection, value)
          : (await listDocuments(collection)).find(
              (item) => item[key] === value
            ) ?? null;

      return row ? withInclude(row, args.include, args.select) : null;
    },

    findFirst: async (args: any = {}) => {
      const rows = await model(collection).findMany({ ...args, take: 1 });
      return rows[0] ?? null;
    },

    findMany: async (args: any = {}) => {
      let rows = (await listDocuments(collection)).filter((row) =>
        matchesWhere(row, args.where)
      );
      rows = sortRows(rows, args.orderBy);
      if (args.skip) rows = rows.slice(args.skip);
      if (args.take !== undefined) rows = rows.slice(0, args.take);

      return Promise.all(
        rows.map((row) => withInclude(row, args.include, args.select))
      );
    },

    count: async (args: any = {}) =>
      (await model(collection).findMany(args)).length,

    create: async (args: any) => {
      const id = args.data.id ?? crypto.randomUUID();
      const data = {
        ...args.data,
        id,
        createdAt: args.data.createdAt ?? new Date(),
        updatedAt: args.data.updatedAt ?? new Date(),
      };

      await commitWrites([{ type: "create", collection, id, data }]);
      return data;
    },

    update: async (args: any) => {
      const id = args.where?.id;
      if (!id) throw new Error("Firebase compatibility layer requires update by id");

      const current = await getDocument(collection, id);
      if (!current) throw new Error(`${collection} document not found`);

      const data = applyMutation(args.data, current);
      await commitWrites([{ type: "update", collection, id, data }]);
      return data;
    },
  };
}

export const prisma = {
  user: model("users"),
  transaction: model("transactions"),
  withdrawal: model("withdrawals"),

  $transaction: async <T>(callback: (tx: any) => Promise<T>) => {
    const tokenResponse = await firestore(":beginTransaction", {
      method: "POST",
      body: JSON.stringify({ options: { readWrite: {} } }),
    });

    const transactionId = tokenResponse.transaction;
    const writes: any[] = [];
    const tx = new TransactionClient(transactionId, writes);

    try {
      const result = await callback(tx);
      await commitWrites(writes, transactionId);
      return result;
    } catch (error) {
      try {
        await firestore(":rollback", {
          method: "POST",
          body: JSON.stringify({ transaction: transactionId }),
        });
      } catch {}
      throw error;
    }
  },
};
