# -*- coding: utf-8 -*-
import xml.etree.ElementTree as ET
import glob
import os

templates = ['healthcare-clinic', 'real-estate-agency', 'field-service', 'restaurant-pos', 'event-association']
errors = []
total_files = 0

for template in templates:
    pattern = os.path.join(template, '**', '*.xml')
    xml_files = glob.glob(pattern, recursive=True)
    total_files += len(xml_files)
    for xml_file in xml_files:
        try:
            ET.parse(xml_file)
        except ET.ParseError as e:
            errors.append(f'{xml_file}: {e}')

if errors:
    print('ERRORS found:')
    for err in errors:
        print(f'  {err}')
else:
    print(f'OK - All {total_files} XML files are valid')
