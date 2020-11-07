import {
    APIGatewayEventDefaultAuthorizerContext,
    APIGatewayProxyEventBase,
    APIGatewayProxyHandler,
} from 'aws-lambda';
import 'source-map-support/register';
import { ErrorsEnum } from '../types/errors.enum';
import {
    formattedErrorResponse,
    formattedSuccessResponse,
} from '../helpers/response.helper';
import { throwError } from '../helpers/error.helper';
import { dbOptions } from '../helpers/db.helper';
import * as pg from 'pg';

export const getProductsList: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 getProductsList: ', event);

    const client = new pg.Client(dbOptions);

    try {
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
                 order by products.title`
            )
            .catch((dbErr) =>
                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr))
            );

        if (!products) {
            throwError(ErrorsEnum.CorruptedData);
        }

        return formattedSuccessResponse({
            count: products.length,
            items: products,
        });
    } catch (error) {
        return formattedErrorResponse(error);
    } finally {
        client.end();
    }
};
