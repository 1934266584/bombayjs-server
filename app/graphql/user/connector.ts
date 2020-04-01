class UserConnector {
  ctx: any;

  constructor(ctx: any) {
    this.ctx = ctx;
  }
  save(name: string) {
    return {
      id: 2,
      name
    };
  }
  fetchById(id: string) {
    console.log(id);
    return {
      id: 1,
      name: 'aaa'
    };
  }
}

module.exports = UserConnector;
