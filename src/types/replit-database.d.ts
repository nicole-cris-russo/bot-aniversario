declare module '@replit/database' {
  export default class Database {
    constructor(url?: string);
    get(key: string): Promise<any>;
    set(key: string, value: any): Promise<void>;
    delete(key: string): Promise<void>;
    list(prefix?: string): Promise<string[]>;
  }
}
