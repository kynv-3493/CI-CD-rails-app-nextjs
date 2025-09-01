FROM ubuntu:20.04

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Asia/Tokyo \
    RUBY_VERSION=3.4.3

WORKDIR /rails

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
    # tzdata = config timezone
    tzdata \
    git-core \
    curl \
    # Lib dependency gem capybara-webkit
    qt5-default \
    libbison-dev \
    libqt5webkit5-dev \
    # Lib dependency gem mysql
    mysql-client \
    libmysqlclient-dev \
    # Lib dependency gem faiss
    libblas-dev \
    liblapack-dev \
    # Lib dependency for rvm
    software-properties-common && \
    # Install RVM https://github.com/rvm/ubuntu_rvm
    apt-add-repository -y ppa:rael-gc/rvm && \
    apt-get update -qq && \
    apt-get install -y --no-install-recommends rvm && \
    # Install nodejs 22 + yarn
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y --no-install-recommends nodejs && \
    npm install --global yarn && \
    # Clear apt cache
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Ruby and Bundler
SHELL ["/bin/bash", "-l", "-c"]
RUN echo 'source "/usr/share/rvm/scripts/rvm"' >> ~/.bashrc && \
    rvm requirements && \
    rvm install ${RUBY_VERSION} && \
    rvm use ${RUBY_VERSION}

# Set path for Ruby
ENV PATH="/usr/share/rvm/rubies/ruby-${RUBY_VERSION}/bin:${PATH}"

COPY Gemfile Gemfile.lock ./
RUN bundle config set path /usr/local/bundle && bundle install

COPY . .

CMD ["bash"]
