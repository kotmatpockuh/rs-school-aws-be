import { SQSEvent } from 'aws-lambda';
import { catalogBatchProcess } from './catalog-batch-process';
import { IProductItem } from '../types/product-item.interface';
import { ProductService } from '../services/product.service';
import AWS, { SNS } from 'aws-sdk';

jest.mock('aws-sdk', () => {
    const SNSMocked = {
        publish: jest.fn().mockReturnThis(),
        promise: jest.fn(),
    };
    return {
        SNS: jest.fn(() => SNSMocked),
    };
});

describe('handler: catalog-batch-process', () => {
    let bodyData: IProductItem;
    let productService: ProductService;
    let sns: SNS;

    beforeEach(() => {
        jest.resetModules();

        productService = new ProductService();

        sns = new AWS.SNS({
            region: 'eu-west-1',
        });
    });

    describe('on catalogBatchProcess', () => {
        describe('given error do not exist', () => {
            it('should call service and sns', () => {
                bodyData = {
                    title: 'fake-title',
                    description: 'fake-description',
                    price: 9,
                    count: 5,
                };

                const createBatchProductsSpy = spyOn(
                    productService,
                    'createBatchProducts'
                );

                catalogBatchProcess(({
                    Records: [
                        {
                            body: JSON.stringify(bodyData),
                        },
                    ],
                } as unknown) as SQSEvent);

                expect(sns.publish().promise).toHaveBeenCalledTimes(1);
                expect(sns.publish).toHaveBeenCalledWith({
                    Subject: '🤔 Data is being processed',
                    Message: JSON.stringify(bodyData),
                    TopicArn: process.env.SNS_ARN,
                });

                expect(createBatchProductsSpy).toHaveBeenCalledTimes(1);
                expect(createBatchProductsSpy).toHaveBeenCalledWith([bodyData]);
            });

            it('should return nothing', async () => {
                bodyData = {
                    title: 'fake-title',
                    description: 'fake-description',
                    price: 9,
                    count: 5,
                };

                await expect(
                    catalogBatchProcess(({
                        Records: [
                            {
                                body: JSON.stringify(bodyData),
                            },
                        ],
                    } as unknown) as SQSEvent)
                ).resolves.toBeUndefined();
            });
        });

        describe('given error exist', () => {
            describe('given Records obj not exist', () => {
                it('should log to console', async () => {
                    const consoleLogSpy = spyOn(console, 'log');

                    catalogBatchProcess(null);

                    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
                    expect(consoleLogSpy).toHaveBeenCalledWith(
                        '📚 catalogBatchProcess Error: ',
                        {
                            log: undefined,
                            statusCode: 400,
                            type: 'wrong_request',
                        }
                    );
                });

                it('should return nothing', async () => {
                    await expect(
                        catalogBatchProcess(null)
                    ).resolves.toBeUndefined();
                });
            });
        });
    });
});
