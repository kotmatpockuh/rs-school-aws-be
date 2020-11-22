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
import { IProductItem } from '../types/product-item.interface';

export const upsertProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 upsertProducts: ', event);

    const client = new pg.Client(dbOptions);

    try {
        const data = <IProductItem>JSON.parse(event?.body || null);

        if (
            data == null ||
            !data?.id ||
            !data?.title ||
            !data?.description ||
            !data?.price ||
            !data?.count
        ) {
            throwError(ErrorsEnum.WrongRequest, 400);
        }

        await client
            .connect()
            .catch((dbErr) =>
                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr))
            );

        let products = [];

        try {
            await client.query('BEGIN');

            await client.query(
                `update
                      products
                    set
                      title = $2,
                      description = $3,
                      price = $4
                    where
                      id = $1`,
                [data?.id, data?.title, data?.description, data?.price]
            );

            await client.query(
                `insert
                      into
                      stocks (product_id, count)
                    values ($1, $2) on
                    conflict (product_id) do
                    update
                    set
                      count = $2`,
                [data?.id, data?.count]
            );

            const { rows: res } = await client.query(
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
                [data?.id]
            );
            products = res;

            await client.query('COMMIT');
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr));
        }

        if (!products[0]) {
            throwError(ErrorsEnum.NotFoundData, 404);
        }

        return formattedSuccessResponse(products);
    } catch (error) {
        return formattedErrorResponse(error);
    } finally {
        client.end();
    }
};
