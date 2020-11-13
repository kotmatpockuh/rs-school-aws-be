export interface IResponseGeneric {
    statusCode: number;
    headers: { [name: string]: string };
    body: string;
}
