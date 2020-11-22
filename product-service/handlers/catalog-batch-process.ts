import { SQSEvent } from 'aws-lambda';
import AWS from 'aws-sdk';
import { DEFAULT_AWS_REGION } from '../../shared/constants';
import { ProductService } from '../services/product.service';
import { IProductItem } from '../types/product-item.interface';
import { throwError } from '../../shared/helpers/error.helper';
import { ErrorsEnum } from '../../shared/types/errors.enum';

export const catalogBatchProcess: (event: SQSEvent) => Promise<void> = async (
    event: SQSEvent
) => {
    console.log('📝 catalogBatchProcess: ', event);

    try {
        const sns = new AWS.SNS(DEFAULT_AWS_REGION);
        const productService = new ProductService();

        const products = <IProductItem[]>(
            (event?.Records || []).map(
                (item) => JSON.parse(item.body) as IProductItem
            )
        );

        if (!products || products?.length === 0) {
            throwError(ErrorsEnum.WrongRequest, 400);
        }

        for (const product of products) {
            await sns
                .publish({
                    Subject: '🤔 Data is being processed',
                    Message: JSON.stringify(product),
                    TopicArn: process.env.SNS_ARN,
                })
                .promise();

            // TODO just for an example
            if (product.title.toUpperCase().includes('FORD')) {
                await sns
                    .publish({
                        Subject: '🤔 Car from USA is being processed',
                        Message: JSON.stringify(product),
                        TopicArn: process.env.SNS_ARN,
                        MessageAttributes: {
                            usaCar: {
                                DataType: 'String',
                                StringValue: product.title,
                            },
                        },
                    })
                    .promise();
            }
        }

        await productService.createBatchProducts(products);
    } catch (error) {
        console.log('📚 catalogBatchProcess Error: ', error);
    }
};
