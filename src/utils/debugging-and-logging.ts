import moment from "moment";
import chalk from "chalk";

function get_caller_location() {
    // https://stackoverflow.com/a/53339452/15675011
    const e = new Error();
    if (!e.stack) {
        return "<error>";
    }
    const frame = e.stack.split("\n")[3];
    const line_number = frame.split(":").reverse()[1];
    const function_name = frame.split(" ")[5];
    return function_name + ":" + line_number;
}

export class M {
    static get_timestamp() {
        return moment().format("MM.DD.YY HH:mm:ss");
    }
    static log(...args: any[]) {
        process.stdout.write(`[${M.get_timestamp()}] [log]     `);
        console.log(...args, `(from: ${get_caller_location()})`);
    }
    static debug(...args: any[]) {
        process.stdout.write(`${chalk.gray(`[${M.get_timestamp()}] [debug] 🐞`)} `);
        console.log(...args, `(from: ${get_caller_location()})`);
    }
    static info(...args: any[]) {
        process.stdout.write(`${chalk.blueBright(`[${M.get_timestamp()}] [info] ℹ️ `)} `);
        console.log(...args, `(from: ${get_caller_location()})`);
    }
    static warn(...args: any[]) {
        process.stdout.write(`${chalk.yellowBright(`[${M.get_timestamp()}] [warn] ⚠️ `)} `);
        console.log(...args, `(from: ${get_caller_location()})`);
    }
    static error(...args: any[]) {
        process.stdout.write(`${chalk.redBright(`[${M.get_timestamp()}] [error] 🛑`)} `);
        console.log(...args);
        console.trace();
    }
}
