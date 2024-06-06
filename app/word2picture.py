import requests
from datetime import datetime
from time import mktime
from wsgiref.handlers import format_date_time
import hashlib
import base64
import hmac
import json
from PIL import Image
from io import BytesIO
import os
from urllib.parse import urlencode

APPID = '87cfc5e7'
APIKEY = '8b17e020009e75e273202ac1f026373b'
APISECRET = 'MDgwYzM1ODM4ZTE1NjdjNjU1ZTZhN2Fm'

def assemble_ws_auth_url(request_url, method="POST"):
    host = "spark-api.cn-huabei-1.xf-yun.com"
    path = "/v2.1/tti"
    now = datetime.now()
    date = format_date_time(mktime(now.timetuple()))
    signature_origin = "host: {}\ndate: {}\n{} {} HTTP/1.1".format(host, date, method, path)
    signature_sha = hmac.new(APISECRET.encode('utf-8'), signature_origin.encode('utf-8'), digestmod=hashlib.sha256).digest()
    signature = base64.b64encode(signature_sha).decode(encoding='utf-8')
    authorization_origin = f'api_key="{APIKEY}", algorithm="hmac-sha256", headers="host date request-line", signature="{signature}"'
    authorization = base64.b64encode(authorization_origin.encode('utf-8')).decode(encoding='utf-8')
    values = {
        "host": host,
        "date": date,
        "authorization": authorization
    }
    return request_url + "?" + urlencode(values)

def getBody(appid, text):
    body = {
        "header": {
            "app_id": appid,
            "uid": "123456789"
        },
        "parameter": {
            "chat": {
                "domain": "general",
                "temperature": 0.5,
                "max_tokens": 4096
            }
        },
        "payload": {
            "message": {
                "text": [
                    {
                        "role": "user",
                        "content": text
                    }
                ]
            }
        }
    }
    return body

def base64_to_image(base64_data, save_path):
    img_data = base64.b64decode(base64_data)
    img = Image.open(BytesIO(img_data))
    
    # 创建保存图像的目录
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    img.save(save_path)

def generate_image(description):
    host = 'http://spark-api.cn-huabei-1.xf-yun.com/v2.1/tti'
    url = assemble_ws_auth_url(host)
    content = getBody(APPID, description)
    response = requests.post(url, json=content, headers={'content-type': "application/json"}).json()
    code = response['header']['code']
    if code != 0:
        return None, f'请求错误: {code}, {response}'
    text = response["payload"]["choices"]["text"]
    image_base = text[0]["content"]
    image_name = response['header']['sid'] + '.jpg'
    save_path = os.path.join('app/static/generated_images', image_name)
    base64_to_image(image_base, save_path)
    return image_name, None
