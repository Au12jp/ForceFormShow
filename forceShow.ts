import * as MC from "@minecraft/server";
import * as UI from "@minecraft/server-ui";

const { system } = MC;

/**
 * @param player 対象プレイヤー
 * @param form ActionFormData | ModalFormData | MessageFormData
 * @param timeoutMs タイムアウト時間（ミリ秒）、デフォルト 1000ms
 * @returns Promise<ActionFormResponse | ModalFormResponse | MessageFormResponse>
 */
export function forceShow(
    player: MC.Player,
    form: UI.ActionFormData | UI.ModalFormData | UI.MessageFormData,
    timeoutMs: number = 1000
): Promise<UI.ActionFormResponse | UI.ModalFormResponse | UI.MessageFormResponse> {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        const intervalId = system.runInterval(async () => {
            if (Date.now() - start > timeoutMs) {
                system.clearRun(intervalId);
                reject(new Error(`${player.name} にフォームを強制送信していましたが、タイムアウトしました。`));
                return;
            }

            try {
                const result = await form.show(player);

                if (result.cancelationReason === UI.FormCancelationReason.UserBusy) {
                    return;
                }

                system.clearRun(intervalId);
                resolve(result);
            } catch (err) {
                system.clearRun(intervalId);
                reject(err);
            }
        }, 10);
    });
}
