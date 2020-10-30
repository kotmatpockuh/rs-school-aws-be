import { ErrorsEnum } from '../types/errors.enum';
import { IError } from '../types/error.interface';

export const formatError = (error: string, log?: string): IError => {
    if (error == null) {
        return null;
    }

    if (!(<String[]>Object.values(ErrorsEnum)).includes(error)) {
        log = (error || '').toString();
    }

    return {
        meta: error,
        description: 'TODO error description 😝',
        log,
    };
};
