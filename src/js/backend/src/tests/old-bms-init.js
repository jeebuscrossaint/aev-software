Send BMS data to client half a second under a try-catch block
if (!this.ports.BMS.interval) {
	this.ports.BMS.interval = true;
	setInterval(() => {
		try {
			if (this.continue.BMS) {
				try {
					this.ports.BMS.port.write('\nsh\n');
					this.ports.BMS.port.drain();
					// ws.send(JSON.stringify(this.ports.BMS.data));
					// this.logger.debug("Updated BMS Data")
					this.ports.BMS.debug.noRes += 1;

					if (this.ports.BMS.debug.noRes > 3) {
						// this.logger.warn('No response from BMS in 3 seconds, restarting BMS');
						// this.stopBMS();
						// // Wait half a second before restarting BMS
						// setTimeout(() => {
						// 	this.initBMS();
						// 	this.ports.BMS.debug.noRes = 0;
						// }, 1000);

						this.BMS.continue = false;
					}
					this.logger.debug('Wrote all commands, waiting for data response');
				} catch (error) {
					console.log(error);
				}
			} else {
				this.logger.warn('Told not to continue sending BMS data through socket, restarting ');
			}
		} catch (error) {
			this.logger.warn('Error updating BMS data: ' + error);
		}
	}, 750);
}

Stop interval if BMS is disabled
setInterval(() => {
	if (!this.ports.BMS.enabled) {
		clearInterval();
	}
}, 1000);