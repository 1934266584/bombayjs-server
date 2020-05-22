import Report from "./web_report";

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const schema = new Schema(
    {
      ...Report,
      duration_ms: Number
    },
    { timestamps: true }
  );
  schema.index({ t: 1, page: 1 });
  schema.index({ page: 1 });

  app.models.WebDuration = (token: string) => {
    return mongoose.model(`web_duration_${token}`, schema);
  };
};
