from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
import os
import shutil
import configparser
import datetime
import boto3


def save_screenshot(target_url: str, bucket_name: str):
    folder = '/opt/app'

    service = Service(executable_path=r'/usr/bin/chromedriver')
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1200x1800')
    prefs = {"download.default_directory" : folder}
    options.add_experimental_option("prefs",prefs)

    driver = webdriver.Chrome(service=service, options=options)

    driver.get(target_url)

    file_name = str(datetime.datetime.now()) + '.png'
    driver.save_screenshot(file_name)
    driver.quit()

    # client = boto3.client('s3',region_name='ap-northeast-1')
    # client.upload_file(file_name, bucket_name, file_name)


if __name__ == '__main__':
    # target_url = os.environ['TARGET_URL']
    target_url = 'https://github.com/'
    bucket_name = os.environ['BUCKET_NAME']
    save_screenshot(target_url, bucket_name)
