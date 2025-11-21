FROM leodotcloud/swiss-army-knife

RUN apt update && apt install -y zip unzip
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
	unzip awscliv2.zip && \
	./aws/install && \
	rm awscliv2.zip

CMD ["tail", "-f", "/dev/null"]

