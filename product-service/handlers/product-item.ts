import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { throwError } from '../../shared/helpers/error.helper';
import { ErrorsEnum } from '../../shared/types/errors.enum';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../../shared/helpers/response.helper';
import { dbOptions } from '../helpers/db.helper';
import * as pg from 'pg';
import { isUUIDv4 } from '../../shared/helpers/request.helper';

export const getProductsById: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 getProductsById: ', event);

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

        const { rows: products } = await client
            .query(
                `select
                     products.id,
                     products.title,
                     products.description,
                     products.price,
                     stocks.count
                 from
                     products
                 left join stocks on
                     products.id = stocks.product_id
                 where products.id = $1`,
                [id]
            )
            .catch((dbErr) =>
                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr))
            );

        if (!products[0]) {
            throwError(ErrorsEnum.NotFoundData, 404);
        }

        return formattedSuccessResponse(products[0]);
    } catch (error) {
        return formattedErrorResponse(error);
    } finally {
        client.end();
    }
};
