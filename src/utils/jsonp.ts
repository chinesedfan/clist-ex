export function jsonp(url: string, callbackName?: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const callback = callbackName || `jsonp_callback_${Date.now()}_${Math.random().toString(36).substr(2)}`;
        const script = document.createElement('script');
        const timeout = setTimeout(() => {
            cleanup();
            reject(new Error('JSONP request timeout'));
        }, 30000);

        function cleanup() {
            clearTimeout(timeout);
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
            delete (window as any)[callback];
        }

        (window as any)[callback] = (data: any) => {
            cleanup();
            resolve(data);
        };

        script.onerror = () => {
            cleanup();
            reject(new Error('JSONP request failed'));
        };

        script.src = `${url}?jsonp=${callback}`;
        document.head.appendChild(script);
    });
}
