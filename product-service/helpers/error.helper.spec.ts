import { formatError } from './error.helper';
import { ErrorsEnum } from '../types/errors.enum';

describe('helper: error', () => {
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
