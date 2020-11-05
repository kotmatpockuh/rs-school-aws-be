import { ErrorsEnum } from './errors.enum';

export interface IError {
    type: ErrorsEnum;
    statusCode?: number;
}
