### Prod: <a href="https://jellyphone.lol/login?test=t">link</a>

## Setup
Install node 22, postgres 17, python 3.10

In client and server folder rename example.env to .env

In server/.env fill JWT_SECRET and KEY with random strings, DB_URL change with your postgres url

Create mail account that allows sending mails programmatically.
If you want to use gmail, here is a quick guide: <a href="https://www.youtube.com/watch?v=ueqZ7RL8zxM">youtube video</a>
Then fill all credentials in .env

#### AWS
Create aws account. If you haven't used aws before you can create free account here: https://aws.amazon.com/free

Create s3 bucket to store user uploaded files

In server/.env fill S3_REGION and S3_BUCKET_NAME with your values

In permissions tab add cors policy:
```JSON
[
    {
        "AllowedHeaders": [
            "*"
        ],
        "AllowedMethods": [
            "PUT"
        ],
        "AllowedOrigins": [
            "http://localhost:5173"
        ],
        "ExposeHeaders": [
            "ETag"
        ],
        "MaxAgeSeconds": 3000
    }
]
```

Create iam user and write it's access key and access secret key in server/.env file

Add this policy to a user:
```JSON
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Statement1",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```
## Start
In client folder run
```
npm i

npm start
```

In server folder run
```
python -m venv .venv

./venv/Scripts/activate

pip install -r requirements.txt

uvicorn main:app --host localhost --port 8000 --reload
```
#### Now it's running on http://localhost:5173
