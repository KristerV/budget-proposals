FROM ubuntu:latest

# Prepare
RUN apt-get update
RUN apt-get install -y unzip wget
RUN apt-get install -y build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3
RUN apt-get install -y libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-program-options-dev libboost-test-dev libboost-thread-dev

# Needs Berkley DB version 4.8
RUN apt-get install -y software-properties-common
RUN add-apt-repository ppa:bitcoin/bitcoin
RUN apt-get update
RUN apt-get install -y libdb4.8-dev libdb4.8++-dev

# Compile helium
WORKDIR /root
RUN wget https://github.com/gjhiggins/dash/archive/helium.zip -O wallet.zip
RUN unzip wallet.zip
WORKDIR /root/dash-helium
RUN ./autogen.sh
RUN ./configure
RUN make
RUN make install

COPY helium-server.conf /root/.heliumcore/helium.conf

# cleanup
WORKDIR /root
RUN rm -rf /root/dash-helium
RUN rm /root/wallet.zip

CMD /usr/local/bin/heliumd
