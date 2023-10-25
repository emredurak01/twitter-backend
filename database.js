class Database {
  constructor(model) {
    this.model = model;
  }

  async getAll() {
    try {
      const data = await this.model.find({});
      return data;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = Database;
