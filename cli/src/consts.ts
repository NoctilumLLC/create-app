import path from "path";
import { fileURLToPath } from "url";

// With the move to TSUP as a build tool, this keeps path routes in other files (installers, loaders, etc) in check more easily.
// Path is in relation to a single index.js file inside ./dist
const __filename = fileURLToPath(import.meta.url);
const distPath = path.dirname(__filename);
export const PKG_ROOT = path.join(distPath, "../");

//export const PKG_ROOT = path.dirname(require.main.filename);

export const TITLE_TEXT = ` _____ ______ _____  ___ _____ _____   _   _ _____ _____ _____ _____ _     _   ____  ___   ___  ____________
/  __ \\| ___ \\  ___|/ _ \\_   _|  ___| | \\ | |  _  /  __ \\_   _|_   _| |   | | | |  \\/  |  / _ \\ | ___ \\ ___ \\
| /  \\/| |_/ / |__ / /_\\ \\| | | |__   |  \\| | | | | /  \\/ | |   | | | |   | | | | .  . | / /_\\ \\| |_/ / |_/ /
| |    |    /|  __||  _  || | |  __|  | . \` | | | | |     | |   | | | |   | | | | |\\/| | |  _  ||  __/|  __/
| \\__/\\| |\\ \\| |___| | | || | | |___  | |\\  \\ \\_/ / \\__/\\ | |  _| |_| |___| |_| | |  | | | | | || |   | |
 \\____/\\_| \\_\\____/\\_| |_/\\_/ \\____/  \\_| \\_/\\___/ \\____/ \\_/  \\___/\\_____/\\___/\\_|  |_/ \\_| |_/\\_|   \\_|
`;
export const DEFAULT_APP_NAME = "my-noctilum-app";
export const CREATE_T3_APP = "create-noctilum-app";
