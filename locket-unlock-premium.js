// ========= Locket Gold Unlock ========= //
// =========  @Auto ========= // 

console.log('🔍 [Locket Gold] Script đã chạy!');

// Kiểm tra URL (http-response nên dùng $response)
if (!$response.url || !$response.url.includes('api.locketcamera.com/setClientData')) {
    console.log('ℹ️ [Locket Gold] Không phải request đến setClientData, bỏ qua');
    $done({});
}

console.log('✅ [Locket Gold] Đã match URL:', $response.url);

var ua = $request.headers["User-Agent"] || $request.headers["user-agent"];
var body = $response.body;

if (!body) {
    console.log('⚠️ [Locket Gold] Không có body trong response');
    $done({});
}

console.log('📦 [Locket Gold] Body size:', typeof body === 'string' ? body.length : 'object');

// Parse JSON payload
var payload;
try {
    if (typeof body === 'string') {
        payload = JSON.parse(body);
    } else {
        payload = body;
    }
    console.log('✅ [Locket Gold] Đã parse JSON thành công');
} catch (e) {
    console.log('❌ [Locket Gold] Lỗi parse JSON:', e.message);
    $done({});
}

// =========   Phần cố định  ========= // 
// =========  @Auto ========= // 

// Hàm đệ quy để unlock premium features
function unlockPremiumFeatures(obj) {
    if (!obj || typeof obj !== 'object') return false;
    
    let changed = false;
    
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            // 1. Sửa feature_gates - đổi tất cả "subscriber" thành "enabled"
            if (key === 'feature_gates' && typeof obj[key] === 'string') {
                try {
                    let featureGates = JSON.parse(obj[key]);
                    let gatesChanged = false;
                    for (let gate in featureGates) {
                        if (featureGates[gate] === 'subscriber') {
                            featureGates[gate] = 'enabled';
                            gatesChanged = true;
                        }
                    }
                    if (gatesChanged) {
                        obj[key] = JSON.stringify(featureGates);
                        console.log('✅ [Locket Gold] Đã unlock feature_gates');
                        changed = true;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            // 2. Sửa upsell_features - bật locket_views
            if (key === 'upsell_features' && typeof obj[key] === 'string') {
                try {
                    let upsell = JSON.parse(obj[key]);
                    if (upsell.locket_views === false) {
                        upsell.locket_views = true;
                        obj[key] = JSON.stringify(upsell);
                        console.log('✅ [Locket Gold] Đã bật locket_views');
                        changed = true;
                    }
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            // 3. Tăng giới hạn bạn bè lên 9999 (unlimited)
            if (key === 'max_friends_count' && obj[key] !== '9999') {
                obj[key] = '9999';
                changed = true;
            }
            if (key === 'signup_max_friends_count' && obj[key] !== '9999') {
                obj[key] = '9999';
                changed = true;
            }
            if (key === 'soft_friend_limit_threshold_count' && obj[key] !== '9999') {
                obj[key] = '9999';
                changed = true;
            }
            
            // 4. Bật Android Gold subscription override
            if (key === 'android_gold_subscription_override' && obj[key] !== 'true') {
                obj[key] = 'true';
                changed = true;
            }
            if (key === 'android_subscribe_gold_button_enabled' && obj[key] !== 'true') {
                obj[key] = 'true';
                changed = true;
            }
            
            // 5. Bật beta features
            if (key === 'beta_features_enabled' && obj[key] !== 'true') {
                obj[key] = 'true';
                changed = true;
            }
            
            // Đệ quy vào nested objects (data.experiments)
            if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                if (unlockPremiumFeatures(obj[key])) {
                    changed = true;
                }
            }
        }
    }
    
    return changed;
}

// Thực hiện unlock
console.log('🚀 [Locket Gold] Bắt đầu unlock premium features...');
if (unlockPremiumFeatures(payload)) {
    // Trả về response body đã được modify
    var newBody = JSON.stringify(payload);
    console.log('✅ [Locket Gold] Đã modify payload thành công! Size:', newBody.length, 'bytes');
    $done({
        body: newBody
    });
} else {
    // Không có gì để thay đổi
    console.log('ℹ️ [Locket Gold] Không có gì để modify, payload đã có premium features');
    $done({});
}

