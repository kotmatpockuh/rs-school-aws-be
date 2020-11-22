import { S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { BUCKET, DEFAULT_AWS_REGION } from '../../shared/constants';
import AWS from 'aws-sdk';
import CSV from 'csv-parser';

export const importFileParser: (
    event: S3Event
) => Promise<{ statusCode: number }> = async (event: S3Event) => {
    try {
        const s3 = new AWS.S3(DEFAULT_AWS_REGION);
        const sqs = new AWS.SQS(DEFAULT_AWS_REGION);

        for (const record of event.Records) {
            if (record.s3.object.key.endsWith('.csv')) {
                const stream = s3
                    .getObject({
                        Bucket: BUCKET,
                        Key: record.s3.object.key,
                    })
                    .createReadStream();

                const csvData = [];

                await stream
                    .pipe(CSV())
                    .on('data', (data) => csvData.push(data))
                    .on('end', () => {
                        console.log(
                            `👀 CSV parsed at ${new Date()}, content: `,
                            csvData
                        );

                        csvData.forEach(async (csvItem) => {
                            await sqs
                                .sendMessage({
                                    QueueUrl: process.env.SQS_URL,
                                    MessageBody: JSON.stringify(csvItem),
                                })
                                .promise();
                        });
                    });
            }

            await s3
                .copyObject({
                    Bucket: BUCKET,
                    CopySource: BUCKET + '/' + record.s3.object.key,
                    Key: `parsed/${record.s3.object.key.replace(
                        'uploaded/',
                        ''
                    )}`,
                })
                .promise();

            console.log('🏓 copied file: ', record.s3.object.key);

            await s3
                .deleteObject({
                    Bucket: BUCKET,
                    Key: record.s3.object.key,
                })
                .promise();

            console.log('🚮 deleted file: ', record.s3.object.key);
        }

        return { statusCode: 202 };
    } catch (error) {
        return { statusCode: 500 };
    }
};
