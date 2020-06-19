const localtunnel = require('localtunnel');

(async () => 
{
    const tunnel = await localtunnel(
    { 
        port: ,
        subdomain: ""
    });

    console.log(tunnel);

    // The assigned public url for your tunnel i.e. https://abcdefgjhij.localtunnel.me
    tunnel.url;

    tunnel.on('close', () => 
    {
        // tunnels are closed
    });
})()
