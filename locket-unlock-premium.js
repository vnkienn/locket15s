/**
 * Shadowrocket Script - Unlock All Premium Features
 * 
 * Script này sẽ tự động unlock toàn bộ tính năng premium (Gold) trong payload API Locket
 * 
 * Tính năng được unlock:
 * - Tất cả feature gates (subscriber → enabled)
 * - Upsell features (bật locket_views)
 * - Unlimited friends (tăng giới hạn lên 9999)
 * - Android Gold subscription override
 * - Beta features
 * 
 * CÁCH CÀI ĐẶT:
 * 1. Mở Shadowrocket → Settings → Script
 * 2. Add Script → Paste code này
 * 3. Đặt tên: "Locket Unlock Premium"
 * 4. Vào Settings → Rewrite → Add Rule:
 *    - Type: Script
 *    - Pattern: ^https://api\.locketcamera\.com/setClientData
 *    - Script: Chọn script vừa tạo
 *    - Requires Body: BẬT
 * 5. Bật rule
 */

// Kiểm tra URL
if (!$request.url || !$request.url.includes('api.locketcamera.com/setClientData')) {
    $done({});
}

// Kiểm tra method
if ($request.method !== 'POST') {
    $done({});
}

// Lấy body
let body = $request.body;
if (!body) {
    $done({});
}

// Parse JSON
let payload;
try {
    if (typeof body === 'string') {
        payload = JSON.parse(body);
    } else {
        payload = body;
    }
} catch (e) {
    $done({});
}

let modified = false;

// Hàm đệ quy để tìm và sửa các giá trị
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
if (unlockPremiumFeatures(payload)) {
    // Trả về body đã được modify
    $done({
        body: JSON.stringify(payload)
    });
} else {
    // Không có gì để thay đổi
    $done({});
}

