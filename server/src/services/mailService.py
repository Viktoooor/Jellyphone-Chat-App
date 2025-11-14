import smtplib
from fastapi import status, HTTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

class MailService:
    def sendActivationMail(email: str, activation_link: str):
        HOST, PORT = settings.SMTP_HOST, settings.SMTP_PORT
        NAME, PASSWORD = settings.SMTP_NAME, settings.SMTP_PASSWORD
        CLIENT_URL = settings.CLIENT_URL

        try:
            msg = MIMEMultipart()
            msg['From'] = NAME
            msg['To'] = email
            msg['Subject'] = "Activation Link"

            body = f"""For activation press on this link: 
            {CLIENT_URL}/activate?link={activation_link}"""
            
            msg.attach(MIMEText(body, 'plain'))

            smtp = smtplib.SMTP(HOST, PORT)

            smtp.starttls()
            smtp.login(NAME, PASSWORD)
            smtp.sendmail(NAME, email, msg.as_string())
            smtp.quit()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error sending email"
            )