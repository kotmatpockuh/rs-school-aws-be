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
                 where products.id = '${id}'`
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

export const createProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 createProducts: ', event);

    const client = new pg.Client(dbOptions);

    try {
        const data = JSON.parse(event?.body || null);

        if (
            data == null ||
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

        let createdId = null;
        let products = [];

        try {
            await client.query('BEGIN');

            const { rows: createdProducts } = await client.query(
                `insert
                    into
                      products(title, description, price)
                 values($1, $2, $3) returning id`,
                [data?.title, data?.description, data?.price]
            );

            createdId = createdProducts[0]?.id;

            await client.query(
                `insert
                   into
                     stocks(product_id, count)
                 values($1, $2)`,
                [createdId, data?.count]
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
                [createdId]
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

        return formattedSuccessResponse(products[0]);
    } catch (error) {
        return formattedErrorResponse(error);
    } finally {
        client.end();
    }
};

export const updateProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 updateProducts: ', event);

    const client = new pg.Client(dbOptions);

    try {
        const data = JSON.parse(event?.body || null);

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

export const removeProducts: APIGatewayProxyHandler = async (
    event: APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>
) => {
    console.log('📝 removeProducts: ', event);

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
