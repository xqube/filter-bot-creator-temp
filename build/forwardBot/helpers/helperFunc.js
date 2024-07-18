import ngrok from "@ngrok/ngrok";
const { PORT, SECRET_TOKEN } = process.env;
export const ngrokurlgen = async () => {
    const listener = await ngrok.forward({
        addr: PORT,
        authtoken: SECRET_TOKEN,
    });
    return listener.url();
};
