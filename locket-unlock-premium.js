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
            
            // 6. Bật các tính năng premium khác (đổi "false" thành "true")
            var premiumFeatures = [
                'custom_profile_pics',
                'chat_reactions_enabled',
                'chat_read_receipts',
                'conversation_reactions',
                'unsend_message_enabled',
                'typing_indicators_enabled',
                'video',
                'zoom_enabled',
                'activity_bar_enabled',
                'widget_badge_enabled',
                'android_enable_widget_pinning',
                'history_friend_card_enabled',
                'show_friend_suggestions_by_default',
                'conversation_drafts_enabled',
                'record_moment_views',
                'moment_reactions_v2',
                'moment_views_enabled',
                'live_photos',
                'music_caption_enabled',
                'captions_enabled'
            ];
            
            if (premiumFeatures.includes(key) && obj[key] === 'false') {
                obj[key] = 'true';
                console.log('✅ [Locket Gold] Đã bật:', key);
                changed = true;
            }
            
            // 7. Bật các tính năng bị tắt (đổi "0" thành "1" hoặc "true")
            var numericFeatures = [
                'conversation_drafts_enabled',
                'moment_upload_queue_persistence_v2',
                'live_activity_fires_initially_enabled',
                'rollcall_live_activity_enabled',
                'android_missed_moments_enabled',
                'android_history_friend_card_enabled',
                'history_grid_scroll_fix_enabled',
                'history_timeline_scroll_fix_enabled',
                'widget_auth_fix_2',
                'timestamp_based_history_fetches',
                'moment_reactions_v2',
                'show_invite_suggestions',
                'persist_onboarding_step',
                'conversations_enabled',
                'locket_yearbook_enabled'
            ];
            
            if (numericFeatures.includes(key) && (obj[key] === '0' || obj[key] === 'false')) {
                obj[key] = '1';
                console.log('✅ [Locket Gold] Đã bật (numeric):', key);
                changed = true;
            }
            
            // 8. Bật các tính năng experimental/optional
            var optionalFeatures = [
                'rollcall_enabled',
                'groups_enabled',
                'android_rollcall_enabled',
                'android_conversations_enabled',
                'join_testflight_enabled',
                'widget_stale_state_enabled'
            ];
            
            if (optionalFeatures.includes(key) && obj[key] === 'false') {
                obj[key] = 'true';
                console.log('✅ [Locket Gold] Đã bật (optional):', key);
                changed = true;
            }
            
            // 9. Tắt quảng cáo và các tính năng không mong muốn
            var disableFeatures = [
                'hide_chat_button',
                'show_friend_limit_on_cam',
                'onboarding_contact_permission_review_fix',
                'get_friend_request_reengagement_status',
                'rollcall_confirm_skip_tagging',
                'notify_moment_views',
                'streak_reminders',
                'rollcall_tap_to_tag_enabled'
            ];
            
            // Giữ các tính năng này ở false (không cần đổi)
            
            // 10. Bật các tính năng notification và interaction
            var interactionFeatures = [
                'notification_reply_body_visible',
                'prompt_notification_permissions_after_friending',
                'chat_read_receipts_mark_as_delivered_extension',
                'show_all_contacts',
                'emoji_friend_suggestions',
                'onboarding_contact_permission_step',
                'signup_allow_skip_add_friends',
                'signup_use_counting_header',
                'clear_search_on_friend_add',
                'populate_phone_numbers_from_suggest_friends'
            ];
            
            if (interactionFeatures.includes(key) && obj[key] === 'false') {
                obj[key] = 'true';
                console.log('✅ [Locket Gold] Đã bật (interaction):', key);
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

