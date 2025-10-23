import os
import smtplib
from fastapi import status, HTTPException
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

class MailService:
    def sendActivationMail(email: str, activation_link: str):
        HOST, PORT = os.getenv("SMTP_HOST"), os.getenv("SMTP_PORT")
        NAME, PASSWORD = os.getenv("SMTP_NAME"), os.getenv("SMTP_PASSWORD")
        CLIENT_URL = os.getenv("CLIENT_URL")

        if not (HOST and PORT and NAME and PASSWORD and CLIENT_URL):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unexpected error"
            )
           
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