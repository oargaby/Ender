


	minecraft.stderr.on('data', function (data) {
		if (data) {
			console.log(""+data);
		}
	});

	minecraft.on('exit', function () {
		minecraft = null;
		console.log('status:'+minecraft);
	});
