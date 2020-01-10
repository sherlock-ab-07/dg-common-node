const roleHTMLCreator = (header, body, urlName, url) => {
    return `<div style="width:100%;display:flex;align-items:center;justify-content:center;;box-sizing: border-box;">
<div style="width:90%;display:flex;align-items:center;justify-content:center;;box-sizing: border-box;">
<div style="background: #f2f2f2;width: 75%;box-shadow:0px 4px 12px #000;border-radius:4px;margin:0 auto;text-align:center;box-sizing: border-box;overflow:hidden">
<div style="background: #474747;text-align:center;height:150px;width:100%;font-weight:bolder;font-size:4em;padding:20px;color:#f2f2f2;"><p style="margin: 30px auto">${header}</p></div>
<div style="background: linear-gradient(135deg,#f82 23%,#ff5e00 32%,transparent 0),linear-gradient(135deg,#ea3a00 38%,#ff5e00 45%,transparent 45%),linear-gradient(135deg,#bfbebe 50%,#bfbebe 55%,#f2f2f2 55%);width:100%;box-sizing:border-box;display:flex;text-align:center;height: 35px;"></div>
<div style="background: #ededed;width:100%;box-sizing: border-box;display: flex;align-items: center;justify-content: center;text-align: center">
<div style="padding: 20px;height: 100%;width: 100%;margin:0 auto;align-items: center;justify-content: center;color:#2a2a2a;box-sizing: border-box;flex-direction: column;">
${body}
<a href=${url} style="font-size: 1.6em;padding: 10px 20px;color: #fff;background: linear-gradient(#ff6203,#FF5722);text-decoration: none;box-shadow: 0px 3px 10px #9e9e9e;border-radius: 30px;margin-top: 30px;display: block;max-width: 300px;margin: 30px auto 0;">${urlName}</a>
</div>
</div>
<div style="background: #474747;height:35px;width:100%;color:#f2f2f2;text-align: center;padding:6px;box-sizing: border-box;">
 Fennix Global
</div>
</div>
</div>
</div>`;
};

const emailBodyForRole = (role) => {
    const roleBody = {
        user: {
            header: 'Welcome to Sofia',
            body: `<p style="font-size: 1.5em;font-weight: bold;margin:0">Its great to have you help us.</p>
                    <p style="font-size: 1.1em;width: 75%;padding: 10px;margin: 0 auto;">Login to manage beneficiaries based on your role and location.You can track beneficiaries,add beneficiaries,add tickets,track beneficiaries and a lot more.</p>
                    <p style="font-weight: bold;margin: 0">Please login to the application by clicking on the below button and set your desired password.</p>`,
            url: `http://patdoj.fennix.global:4200/newLogin`,
            urlName: 'Sofia - Admin Login'
        },
        beneficiary: {
            header: 'Its awesome to have you onboard<br>Welcome to Sofia',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Welcome</p>
                    <p style="font-size: 1.1em;width:60%;padding: 10px;margin:0 auto;">Login to see various metrics of your respective device,your details and a lot more.</p>
                    <p style="font-weight: bold;margin: 0">Please login to the application by clicking on the below button and set your desired password.</p>`,
            url: 'http://patdoj.fennix.global:4200/newLogin',
            urlName: 'Sofia'
        },
        elock_operator: {
            header: 'Its awesome to have you onboard<br>Welcome to Sofia',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Welcome</p>
                    <p style="font-size: 1.1em;width:60%;padding: 10px;margin:0 auto;">Log in to manage Clients and users based on your role and location. You can modify your Client's containers, Create Trips, routes, geofences, stops, and rules, manage tickets. You can also manage e-locks, providers and communications components.</p>
                    <p style="font-weight: bold;margin: 0">Please login to the application by clicking on the below button and set your desired password.</p>`,
            url: 'http://patdoj.fennix.global:4200/newLogin',
            urlName: 'Sofia'
        },
        customs: {
            header: 'Its awesome to have you onboard<br>Welcome to Sofia',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Welcome</p>
                    <p style="font-size: 1.1em;width:60%;padding: 10px;margin:0 auto;">Log in to manage Clients based on your role and location. You can view a list of Clients, track Client's containers, monitor containers activity and Container's historical events and violations. You can also approve or disapprove unlocking of e-locks.</p>
                    <p style="font-weight: bold;margin: 0">Please login to the application by clicking on the below button and set your desired password.</p>`,
            url: 'http://patdoj.fennix.global:4200/newLogin',
            urlName: 'Sofia - Custom'
        },
        client: {
            header: 'Its awesome to have you onboard<br>Welcome to Sofia',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Welcome</p>
                    <p style="font-size: 1.1em;width:60%;padding: 10px;margin:0 auto;">Log in to manage your users based on your role. You can view a list of your users, manage your company profile, invoices and billing plans, track your containers, monitor your container's activity and Container's historical events and violations. You can also add tickets.</p>
                    <p style="font-weight: bold;margin: 0">Please login to the application by clicking on the below button and set your desired password.</p>`,
            url: 'http://patdoj.fennix.global:4200/newLogin',
            urlName: 'Sofia'
        },
        start_trip: {
            header: 'We have an update on your E-Lock Trip',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Your trip has started</p>`,
            url: 'http://patdoj.fennix.global:4200/login',
            urlName: 'See Trip Details'
        },
        geo_fence: {
            header: 'We have an update on your E-Lock Trip',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Your trip has geo-fence violation.</p>`,
            url: 'http://patdoj.fennix.global:4200/login',
            urlName: 'See Trip Details'
        },
        end_trip: {
            header: 'We have an update on your E-Lock Trip',
            body: `<p style="font-size: 1.3em;font-weight: bold;margin:0">Your trip has ended.</p>`,
            url: 'http://patdoj.fennix.global:4200/newLogin',
            urlName: 'See Trip Details'
        }
    };
    return roleBody[role];
};

const roleMailBody = {
    1: emailBodyForRole('beneficiary'),
    2: emailBodyForRole('beneficiary'),
    3: emailBodyForRole('user'),
    4: emailBodyForRole('user'),
    5: emailBodyForRole('user'),
    6: emailBodyForRole('user'),
    7: emailBodyForRole('user'),
    8: emailBodyForRole('user'),
    9: emailBodyForRole('customs'),
    10: emailBodyForRole('client'),
    11: emailBodyForRole('elock_operator'),
    'start_trip': emailBodyForRole('start_trip'),
    'end_trip': emailBodyForRole('end_trip'),
    'geo_fence': emailBodyForRole('geo_fence')
};

module.exports = {
    roleHTMLCreator,
    roleMailBody
};