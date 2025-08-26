import { Schema } from 'mongoose';

export function softDeletePlugin(schema: Schema) {
  schema.add({ deleted: { type: Boolean, default: false } });
  schema.add({ deletedAt: { type: Date, default: null } });

  schema.methods.softDelete = function () {
    this.deleted = true;
    this.deletedAt = new Date();
    return this.save();
  };

  schema.methods.restore = function () {
    this.deleted = false;
    this.deletedAt = null;
    return this.save();
  };

  schema.pre(/^find/, function (next) {
    this.where({ deleted: { $ne: true } });
    next();
  });
}
