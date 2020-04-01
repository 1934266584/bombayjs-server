import { Controller } from 'egg';

export default class EventVariateController extends Controller {
  async get() {
    const { ctx } = this;
    ctx.body = await ctx.service.eventVariate.get();
  }

  async set() {
    const { ctx } = this;
    ctx.body = await ctx.service.eventVariate.set();
  }

  async list() {
    const { ctx } = this;
    ctx.body = await ctx.service.eventVariate.list();
  }

}
