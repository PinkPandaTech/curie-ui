
import json


data ={'total_ratio': 43.89, 
'right_ratio': {'lt': 99.44, 'rt': 100.0, 'rb': 39.56, 'lb': 94.3}, 
'left_ratio': {'lt': 0.0, 'rt': 0.0, 'rb': 19.24, 'lb': 0.0}, 
'label': 'SANO', 'confidence': 0.5045164823532104, 
'cuadrants': {'left': {'x': 1088, 'y': 902}, 'right': {'x': 2354, 'y': 936}}}

json_data = json.dumps(data)

print(json_data)

