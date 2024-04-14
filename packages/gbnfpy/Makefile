init:
	pip install -r requirements.txt

test:
	nosetests tests

copy_assets:
	cp ../../README.md ./ && cp ../../LICENSE ./ 

build_package:
	python3 -m build && make copy_assets
