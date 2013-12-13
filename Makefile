local:
	brunch w -s

build:
	brunch build

deploy: build
	rsync -rtzh --progress --delete public/ ec2:/var/www/jamie-wong.com/experiments/travelmap
