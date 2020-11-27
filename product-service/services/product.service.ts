import { dbOptions } from '../helpers/db.helper';
import * as pg from 'pg';
import { IProductItem } from '../types/product-item.interface';
import { throwError } from '../../shared/helpers/error.helper';
import { ErrorsEnum } from '../../shared/types/errors.enum';

export class ProductService {
    client: pg.Client;

    constructor() {
        this.client = new pg.Client(dbOptions);
    }

    async createProductQuery(product: IProductItem): Promise<IProductItem> {
        let createdId = null;
        let products = [];

        try {
            await this.client.query('BEGIN');

            const { rows: createdProducts } = await this.client.query(
                `insert
                    into
                      products(title, description, price)
                 values($1, $2, $3) returning id`,
                [product?.title, product?.description, product?.price]
            );

            createdId = createdProducts[0]?.id;

            await this.client.query(
                `insert
                   into
                     stocks(product_id, count)
                 values($1, $2)`,
                [createdId, product?.count]
            );

            const { rows: res } = await this.client.query(
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

            await this.client.query('COMMIT');
        } catch (dbErr) {
            await this.client.query('ROLLBACK');
            console.log('👲 222', dbErr);
            throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr));
        }

        if (!products[0]) {
            throwError(ErrorsEnum.NotFoundData, 404);
        }

        return products[0];
    }

    async createProduct(product: IProductItem): Promise<IProductItem> {
        try {
            if (
                product == null ||
                !product?.title ||
                !product?.description ||
                !product?.price ||
                !product?.count
            ) {
                throwError(ErrorsEnum.WrongRequest, 400);
            }

            await this.client.connect().catch((dbErr) => {
                console.log('👲 Single', dbErr);

                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr));
            });

            return await this.createProductQuery(product);
        } catch (error) {
            throw error;
        } finally {
            await this.client.end();
        }
    }

    async createBatchProducts(
        products: IProductItem[]
    ): Promise<IProductItem[]> {
        try {
            const createdProducts: IProductItem[] = [];

            await this.client.connect().catch((dbErr) => {
                console.log('👲 Batch', dbErr);

                throwError(ErrorsEnum.DBError, 500, JSON.stringify(dbErr));
            });

            for (const product of products) {
                console.log('👉️ Product is: ', product);

                createdProducts.push(await this.createProductQuery(product));
            }

            return createdProducts;
        } catch (error) {
            throw error;
        } finally {
            await this.client.end();
        }
    }
}
