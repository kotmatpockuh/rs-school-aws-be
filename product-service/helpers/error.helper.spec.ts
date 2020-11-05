import { formatError, throwError } from './error.helper';
import { ErrorsEnum } from '../types/errors.enum';

describe('helper: error', () => {
    describe('on throwError', () => {
        describe('given error is null', () => {
            it('should return null error', () => {
                try {
                    throwError(null);
                } catch (e) {
                    expect(e).toEqual({
                        type: null,
                        statusCode: 500,
                    });
                }
            });
        });

        describe('given error is presented', () => {
            it('should return error', () => {
                try {
                    throwError(ErrorsEnum.NotFoundData, 405);
                } catch (e) {
                    expect(e).toEqual({
                        type: ErrorsEnum.NotFoundData,
                        statusCode: 405,
                    });
                }
            });
        });
    });

    describe('on formatError', () => {
        describe('given error is null', () => {
            it('should return null error', () => {
                expect(formatError(null)).toEqual(null);
            });
        });

        describe('given error is undefined', () => {
            it('should return null error', () => {
                expect(formatError(undefined)).toEqual(null);
            });
        });

        describe('given error is from ErrorsEnum', () => {
            it('should return valid error', () => {
                expect(formatError(ErrorsEnum.GenericError)).toEqual({
                    meta: ErrorsEnum.GenericError,
                    description: 'TODO error description 😝',
                });
            });
        });

        describe('given error is not from ErrorsEnum', () => {
            it('should return valid error', () => {
                const error = 'some-fake-error';

                expect(formatError(error)).toEqual({
                    meta: error,
                    description: 'TODO error description 😝',
                    log: error,
                });
            });
        });
    });
});
