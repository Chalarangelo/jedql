import { Field } from 'src/field';
import { standardTypes } from 'src/types';
import symbols from 'src/symbols';

const { $defaultValue } = symbols;

describe('Field', () => {
  it('throws if "name" is invalid', () => {
    expect(() => new Field({ name: null })).toThrow();
    expect(() => new Field({ name: undefined })).toThrow();
    expect(() => new Field({ name: '' })).toThrow();
    expect(() => new Field({ name: ' ' })).toThrow();
    expect(() => new Field({ name: '_a' })).toThrow();
    expect(() => new Field({ name: '1' })).toThrow();
    expect(() => new Field({ name: 'a&1*b' })).toThrow();
  });

  it('throws if "required" is invalid', () => {
    expect(() => new Field({ required: null })).toThrow();
    expect(() => new Field({ required: undefined })).toThrow();
    expect(() => new Field({ required: 'a' })).toThrow();
  });

  it('throws if "type" is invalid', () => {
    expect(() => new Field({ type: null })).toThrow();
    expect(() => new Field({ type: undefined })).toThrow();
    expect(() => new Field({ type: 'a' })).toThrow();
  });

  describe('when arguments are valid', () => {
    let field;
    beforeEach(() => {
      field = new Field({ name: 'myField', type: x => x === 'test' });
    });

    it('has the correct name', () => {
      expect(field.name).toBe('myField');
    });

    it('is not required', () => {
      expect(field.required).toBe(false);
    });

    it('correctly checks values based on the given type', () => {
      expect(field.typeCheck('test')).toBe(true);
      expect(field.typeCheck('test2')).toBe(false);
    });

    it('correctly checks empty values', () => {
      expect(field.typeCheck(null)).toBe(true);
      expect(field.typeCheck(undefined)).toBe(true);
    });

    describe('when the field is required', () => {
      beforeEach(() => {
        field = new Field({
          name: 'myField',
          type: x => x === 'test',
          required: true,
          defaultValue: 'test',
        });
      });

      it('throws if "defaultValue" is invalid', () => {
        expect(
          () =>
            new Field({
              name: 'myField',
              type: x => x === 'test',
              required: true,
            })
        ).toThrow();
        expect(
          () =>
            new Field({
              name: 'myField',
              type: x => x === 'test',
              required: true,
              defaultValue: 'test2',
            })
        ).toThrow();
      });

      it('is required', () => {
        expect(field.required).toBe(true);
      });

      it('correctly checks values based on the given type', () => {
        expect(field.typeCheck('test')).toBe(true);
        expect(field.typeCheck('test2')).toBe(false);
      });

      it('correctly checks empty values', () => {
        expect(field.typeCheck(null)).toBe(false);
        expect(field.typeCheck(undefined)).toBe(false);
      });
    });
  });

  describe('standard types', () => {
    const standardTypesEntries = Object.entries(standardTypes);

    test.each(standardTypesEntries)('%s is defined', typeName => {
      expect(Field[typeName]).toBeDefined();
    });

    test.each(standardTypesEntries)(
      '%s accepts a string as a name and returns a Field of the appropriate type',
      (typeName, standardType) => {
        const field = Field[typeName]('myField');
        expect(field).toBeInstanceOf(Field);
        expect(field.name).toBe('myField');
        expect(field.required).toBe(false);
        expect(field.typeCheck(standardType.defaultValue)).toBe(true);
      }
    );

    test.each(standardTypesEntries)(
      '%s accepts a valid object and returns a Field of the appropriate type',
      (typeName, standardType) => {
        const field = Field[typeName]({
          name: 'myField',
          defaultValue: standardType.defaultValue,
        });
        expect(field).toBeInstanceOf(Field);
        expect(field.name).toBe('myField');
        expect(field[$defaultValue]).toBe(standardType.defaultValue);
        expect(field.typeCheck(standardType.defaultValue)).toBe(true);
      }
    );

    test.each(standardTypesEntries)('%sRequired is defined', typeName => {
      expect(Field[`${typeName}Required`]).toBeDefined();
    });

    test.each(standardTypesEntries)(
      '%sRequired accepts a string as a name and returns a Field of the appropriate type',
      (typeName, standardType) => {
        const field = Field[`${typeName}Required`]('myField');
        expect(field).toBeInstanceOf(Field);
        expect(field.name).toBe('myField');
        expect(field.required).toBe(true);
        expect(field[$defaultValue]).toBe(standardType.defaultValue);
        expect(field.typeCheck(standardType.defaultValue)).toBe(true);
      }
    );

    test.each(standardTypesEntries)(
      '%sRequired accepts a valid object and returns a Field of the appropriate type',
      (typeName, standardType) => {
        const field = Field[`${typeName}Required`]({
          name: 'myField',
          defaultValue: standardType.defaultValue,
        });
        expect(field).toBeInstanceOf(Field);
        expect(field.name).toBe('myField');
        expect(field.required).toBe(true);
        expect(field[$defaultValue]).toBe(standardType.defaultValue);
        expect(field.typeCheck(standardType.defaultValue)).toBe(true);
      }
    );
  });

  describe('special types', () => {
    const specialTypes = ['enum', 'enumRequired', 'auto'];
    test.each(specialTypes)('%s is defined', typeName => {
      expect(Field[typeName]).toBeDefined();
    });

    it('enum accepts a valid object and returns a Field of the appropriate type', () => {
      const field = Field.enum({
        name: 'myField',
        values: ['a', 'b'],
      });
      expect(field).toBeInstanceOf(Field);
      expect(field.name).toBe('myField');
      expect(field.required).toBe(false);
      expect(field.typeCheck('a')).toBe(true);
      expect(field.typeCheck('c')).toBe(false);
    });

    it('enumRequired accepts a valid object and returns a Field of the appropriate type', () => {
      const field = Field.enumRequired({
        name: 'myField',
        values: ['a', 'b'],
        defaultValue: 'b',
      });
      expect(field).toBeInstanceOf(Field);
      expect(field.name).toBe('myField');
      expect(field.required).toBe(true);
      expect(field[$defaultValue]).toBe('b');
      expect(field.typeCheck('a')).toBe(true);
      expect(field.typeCheck('c')).toBe(false);
    });

    it('enumRequired accepts a valid object without defaultValue and returns a Field of the appropriate type', () => {
      const field = Field.enumRequired({
        name: 'myField',
        values: ['a', 'b'],
      });
      expect(field).toBeInstanceOf(Field);
      expect(field.name).toBe('myField');
      expect(field.required).toBe(true);
      expect(field[$defaultValue]).toBe('a');
      expect(field.typeCheck('a')).toBe(true);
      expect(field.typeCheck('c')).toBe(false);
    });

    it('auto accepts a string as a name and returns a Field of the appropriate type', () => {
      const field = Field.auto('myField');
      expect(field).toBeInstanceOf(Field);
      expect(field.name).toBe('myField');
      expect(field.required).toBe(true);
      expect(field[$defaultValue]).toBe(0);
      expect(field[$defaultValue]).toBe(1);
    });

    it('auto accepts a valid object and returns a Field of the appropriate type', () => {
      const field = Field.auto({ name: 'myField' });
      expect(field).toBeInstanceOf(Field);
      expect(field.name).toBe('myField');
      expect(field.required).toBe(true);
      expect(field[$defaultValue]).toBe(0);
      expect(field[$defaultValue]).toBe(1);
    });
  });
});