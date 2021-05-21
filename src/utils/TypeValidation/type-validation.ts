import Ajv, {ValidateFunction} from 'ajv';
import {Schema} from 'ajv/lib/types/index';
import {JSONSchemaType} from 'ajv/lib/types/json-schema';
import ModelTypes from '../../api/model-types.json';

export default class TypeValidation {
  private static instance: Ajv = new Ajv().addSchema(ModelTypes);

  static validatorFor<T>(schema: Schema | JSONSchemaType<T>):ValidateFunction<T> {
    return this.instance.compile(schema);
  }

  static validationError(context: string): Error {
    return new Error(`Non valid JSON error for context ${context}.`);
  }
}
