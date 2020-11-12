import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { throwError } from '../helpers/error.helper';
import { ErrorsEnum } from '../types/errors.enum';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../helpers/response.helper';
import { dbOptions } from '../helpers/db.helper';
import * as pg from 'pg';
import { isUUIDv4 } from '../helpers/request.helper';

export const deleteProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 deleteProducts: ', event);

    const client = new pg.Client(dbOptions);

    try {
        const id = event?.pathParameters?.productId;

        if (id == null || (id && !isUUIDv4(id))) {
            throwError(ErrorsEnum.WrongRequest, 400);
        }

        await client
            .connect()
            .catch((dbErr) =>
                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr))
            );

        await client
            .query(
                `delete
                    from
                      products
                    where
                      id = $1`,
                [id]
            )
            .catch((dbErr) =>
                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr))
            );

        return formattedSuccessResponse({});
    } catch (error) {
        return formattedErrorResponse(error);
    } finally {
        client.end();
    }
};
