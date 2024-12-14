import * as sqlite from "sqlite3";

export class DatabaseConnection {
  private db: sqlite.Database;

  open() {
    this.db = new sqlite.Database("./database/database.sqlite3");
  }

  async getAll(sql: string, data: any = undefined) {
    return new Promise<any[]>((resolve, reject) => {
      this.db.all(sql, data, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  async run(sql: string, data: any) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, data, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  close() {
    this.db.close();
    this.db = undefined;
  }
}
