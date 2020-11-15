import { S3Event } from 'aws-lambda';
import 'source-map-support/register';
import { BUCKET } from '../constants';
import AWS from 'aws-sdk';
import CSV from 'csv-parser';

export const importFileParser: (
    event: S3Event
) => Promise<{ statusCode: number }> = async (event: S3Event) => {
    try {
        const s3 = new AWS.S3({ region: 'eu-west-1' });

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
                    .on('end', () =>
                        console.log(
                            `👀 CSV parsed at ${new Date()}, content: `,
                            csvData
                        )
                    );
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

            await s3
                .deleteObject({
                    Bucket: BUCKET,
                    Key: record.s3.object.key,
                })
                .promise();
        }

        return { statusCode: 202 };
    } catch (error) {
        return { statusCode: 500 };
    }
};
