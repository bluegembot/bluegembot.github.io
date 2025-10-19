import { defineComponent, onMounted, ref, computed } from "vue";
import ImportSkinsModal from "../../components/UserDashboard/ImportSkinsModal.vue";
import { API_URL } from "@/config/environment";
// Import the JSON file directly
import skinsData from "@/assets/skins.json";

interface SkinItem {
    imageUrl: string;
    itemName: string;
}

export default defineComponent({
    components: {
        ImportSkinsModal
    },
    setup() {
        const username = ref("");
        const chatId = ref("");
        const subscriptionStatus = ref("");
        const subscriptionEndDate = ref("");
        const wantedSources = ref("")
        const errorMessage = ref("");
        const popupVisible = ref(false);
        const messageType = ref("");

        // Import modal related data
        const importModalVisible = ref(false);
        const importData = ref("");
        const importError = ref("");
        const importLoading = ref(false);

        //Database validation related data

        // Function to clean item names (remove wear and special attributes)
        const cleanItemName = (itemName: string): string => {
            let cleanName = itemName;

            // Handle items with special attributes (contains '+')
            if (cleanName.includes('+')) {
                // Split by '+' and take only the first part
                cleanName = cleanName.split('+')[0];
            }

            // Then remove the wear condition (last two segments)
            // Split by '-', remove last 2 parts, then join back with '-'
            const nameParts = cleanName.split('-');
            const nameWithoutWear = nameParts.slice(0, -2).join('-');

            return nameWithoutWear;
        };

        // Function to process item names from the JSON file
        const processItemNamesFromJson = (): string[] => {
            const processedNames: string[] = [];

            try {
                // Cast the imported data to the correct type
                const items = skinsData as SkinItem[];

                items.forEach(item => {
                    const cleanName = cleanItemName(item.itemName);
                    console.log(cleanName);
                    processedNames.push(cleanName);
                });

                return processedNames;
            } catch (error) {
                console.error('Error processing skins data:', error);
                return [];
            }
        };

        // Function to validate imported skins against the JSON file
        const validateImportedSkins = (importedSkins: any[]): { validSkins: any[], invalidSkins: any[] } => {
            const validSkins: any[] = [];
            const invalidSkins: any[] = [];

            // Get all clean names from the JSON file for comparison
            const availableCleanNames = new Set<string>();
            const items = skinsData as SkinItem[];

            items.forEach(item => {
                const cleanName = cleanItemName(item.itemName);
                availableCleanNames.add(cleanName);
            });

            // Validate each imported skin
            importedSkins.forEach(skin => {
                const cleanImportedName = cleanItemName(skin.itemOfInterest);

                if (availableCleanNames.has(cleanImportedName)) {
                    validSkins.push(skin);
                } else {
                    invalidSkins.push({
                        ...skin,
                        reason: `Skin "${cleanImportedName}" not found in available skins database`
                    });
                }
            });

            return { validSkins, invalidSkins };
        };

        // Placeholder for the textarea
        const importPlaceholder = `[
  {
    "itemOfInterest": "ak-47-redline-factory-new",
    "minWear": 0,
    "maxWear": 0.07,
    "forcedDiscount": false,
    "minFadePercentage": false
  },
  {
    "itemOfInterest": "ak-47-redline-field-tested",
    "minWear": 0.15,
    "maxWear": 0.38,
    "forcedDiscount": false,
    "minFadePercentage": false
  }
]`;

        const clearErrorMessages = () => {
            setTimeout(() => {
                errorMessage.value = '';
            }, 2500);
        };

        const formatDate = (dateString : string) => {
            if (!dateString || dateString === "Indefinite") return dateString;

            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        };

        // Or use a computed property
        const formattedEndDate = computed(() => {
            return formatDate(subscriptionEndDate.value);
        });

        // Import modal methods
        const openImportModal = () => {
            importModalVisible.value = true;
            importData.value = "";
            importError.value = "";
            importLoading.value = false;
            processItemNamesFromJson();
        };

        const closeImportModal = () => {
            importModalVisible.value = false;
            importData.value = "";
            importError.value = "";
            importLoading.value = false;
        };

        const validateJsonData = (jsonString: string) => {
            try {
                // Check for duplicate keys within individual objects
                const checkDuplicateKeysInObjects = (str: string): string | null => {
                    // Find all object boundaries
                    const objectPattern = /\{[^{}]*\}/g;
                    let objectMatch;

                    while ((objectMatch = objectPattern.exec(str)) !== null) {
                        const objectStr = objectMatch[0];
                        const keyPattern = /"([^"]+)"\s*:/g;
                        const keys: string[] = [];
                        let keyMatch;

                        while ((keyMatch = keyPattern.exec(objectStr)) !== null) {
                            const key = keyMatch[1];
                            if (keys.includes(key)) {
                                return key;
                            }
                            keys.push(key);
                        }
                    }
                    return null;
                };

                const duplicateKey = checkDuplicateKeysInObjects(jsonString);
                if (duplicateKey) {
                    throw new Error(`Duplicate property "${duplicateKey}" found within a single object. Each property must appear only once per object.`);
                }

                let parsed;
                try {
                    parsed = JSON.parse(jsonString);
                } catch (parseError) {
                    // Provide more helpful error messages for common JSON syntax errors
                    const errorMsg = parseError instanceof Error ? parseError.message : 'Invalid JSON';
                    if (errorMsg.includes('trailing comma') || errorMsg.includes('Unexpected token')) {
                        throw new Error(`Invalid JSON syntax: ${errorMsg}. Common issues: trailing commas, missing quotes, or extra commas.`);
                    }
                    throw new Error(`Invalid JSON format: ${errorMsg}`);
                }

                if (!Array.isArray(parsed)) {
                    throw new Error("Data must be an array of objects");
                }

                // Check maximum items limit
                if (parsed.length > 50) {
                    throw new Error(`Maximum 50 items allowed. You provided ${parsed.length} items.`);
                }

                if (parsed.length === 0) {
                    throw new Error("Array cannot be empty");
                }

                // Validate each skin object structure and values
                for (let i = 0; i < parsed.length; i++) {
                    const skin = parsed[i];
                    const index = i + 1;

                    // Check that each item is an object
                    if (typeof skin !== 'object' || skin === null || Array.isArray(skin)) {
                        throw new Error(`Item ${index}: Must be an object, not ${Array.isArray(skin) ? 'array' : typeof skin}`);
                    }

                    // Check exact object structure - must have exactly these 5 properties
                    const requiredKeys = ['itemOfInterest', 'minWear', 'maxWear', 'forcedDiscount', 'minFadePercentage'];
                    const skinKeys = Object.keys(skin);

                    // Check if object has exactly the required keys
                    if (skinKeys.length !== requiredKeys.length) {
                        throw new Error(`Item ${index}: Object must have exactly ${requiredKeys.length} properties (itemOfInterest, minWear, maxWear, forcedDiscount, minFadePercentage). Found ${skinKeys.length} properties.`);
                    }

                    // Check if all required keys are present
                    for (const key of requiredKeys) {
                        if (!(key in skin)) {
                            throw new Error(`Item ${index}: Missing required property "${key}"`);
                        }
                    }

                    // Check for extra properties
                    for (const key of skinKeys) {
                        if (!requiredKeys.includes(key)) {
                            throw new Error(`Item ${index}: Unexpected property "${key}". Only allowed properties are: ${requiredKeys.join(', ')}`);
                        }
                    }

                    // Validate itemOfInterest
                    if (!skin.itemOfInterest || typeof skin.itemOfInterest !== 'string') {
                        throw new Error(`Item ${index}: itemOfInterest is required and must be a string`);
                    }

                    // Validate minWear
                    if (typeof skin.minWear !== 'number') {
                        throw new Error(`Item ${index}: minWear must be a number`);
                    }
                    if (skin.minWear < 0 || skin.minWear > 1) {
                        throw new Error(`Item ${index}: minWear must be between 0 and 1 (got ${skin.minWear})`);
                    }

                    // Validate maxWear
                    if (typeof skin.maxWear !== 'number') {
                        throw new Error(`Item ${index}: maxWear must be a number`);
                    }
                    if (skin.maxWear < 0 || skin.maxWear > 1) {
                        throw new Error(`Item ${index}: maxWear must be between 0 and 1 (got ${skin.maxWear})`);
                    }

                    // Validate minWear <= maxWear
                    if (skin.minWear > skin.maxWear) {
                        throw new Error(`Item ${index}: minWear (${skin.minWear}) cannot be greater than maxWear (${skin.maxWear})`);
                    }

                    // Validate forcedDiscount
                    if (skin.forcedDiscount !== false && typeof skin.forcedDiscount !== 'number') {
                        throw new Error(`Item ${index}: forcedDiscount must be false or a number (got ${typeof skin.forcedDiscount})`);
                    }
                    if (typeof skin.forcedDiscount === 'number' && (skin.forcedDiscount < 0 || skin.forcedDiscount > 100)) {
                        throw new Error(`Item ${index}: forcedDiscount as number should be between 0 and 100 (got ${skin.forcedDiscount})`);
                    }

                    // Validate minFadePercentage
                    if (skin.minFadePercentage !== false && typeof skin.minFadePercentage !== 'number') {
                        throw new Error(`Item ${index}: minFadePercentage must be false or a number (got ${typeof skin.minFadePercentage})`);
                    }
                    if (typeof skin.minFadePercentage === 'number' && (skin.minFadePercentage < 0 || skin.minFadePercentage > 100)) {
                        throw new Error(`Item ${index}: minFadePercentage as number should be between 0 and 100 (got ${skin.minFadePercentage})`);
                    }
                }

                return { isValid: true, data: parsed };
            } catch (error) {
                return {
                    isValid: false,
                    error: error instanceof Error ? error.message : "Invalid JSON format"
                };
            }
        };

        const sendSkinsToBackend = async (itemsData: any[]) => {
            try {
                console.log(API_URL)
                const response = await fetch(`${API_URL}/skins/import`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: chatId.value,
                        username: username.value,
                        items: itemsData,
                    }),
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const result = await response.json();
                return { success: true, data: result };
            } catch (error) {
                console.error('Error sending items to backend:', error);
                return {
                    success: false,
                    error: error instanceof Error ? error.message : "Failed to import items"
                };
            }
        };

        const importSkins = async (jsonData: string) => {
            importError.value = "";
            importLoading.value = true;

            if (!jsonData.trim()) {
                importError.value = "Please enter JSON data";
                importLoading.value = false;
                return;
            }

            // Validate JSON
            const validation = validateJsonData(jsonData);
            if (!validation.isValid) {
                importError.value = `Invalid JSON`;
                importLoading.value = false;
                return;
            }

            // TypeScript guard: ensure validation.data exists
            if (!validation.data) {
                importError.value = "No data found in JSON";
                importLoading.value = false;
                return;
            }

            // Validate imported skins against available skins in JSON file
            const { validSkins, invalidSkins } = validateImportedSkins(validation.data);

            if (invalidSkins.length > 0) {
                console.warn('Invalid skins found:', invalidSkins);
                const invalidNames = invalidSkins.map(skin => cleanItemName(skin.itemOfInterest)).join(', ');
                importError.value = `${invalidSkins.length} skin(s) not found in database: ${invalidNames}`;
                importLoading.value = false;
                return;
            }

            if (validSkins.length === 0) {
                importError.value = "No valid skins found to import";
                importLoading.value = false;
                return;
            }

            // Send only valid skins to backend
            const result = await sendSkinsToBackend(validSkins);

            if (result.success) {
                messageType.value = "success";
                const summary = result.data.summary;
                if (summary) {
                    errorMessage.value = `Import completed! ${summary.successful} added, ${summary.skipped} skipped, ${summary.failed} failed.`;
                } else {
                    errorMessage.value = `Successfully imported ${validSkins.length} valid skins!`;
                }

                if (invalidSkins.length > 0) {
                    errorMessage.value += ` ${invalidSkins.length} skins were rejected (not found in database).`;
                }

                clearErrorMessages();
                closeImportModal();
            } else {
                importError.value = result.error || "Failed to import items";
            }

            importLoading.value = false;
        };

        onMounted(() => {
            username.value = localStorage.getItem("username") || "";
            chatId.value = localStorage.getItem("chatId") || "";
            subscriptionStatus.value = localStorage.getItem("subscriptionStatus") || "";
            subscriptionEndDate.value = localStorage.getItem("subscriptionEndDate") || "";
            wantedSources.value = localStorage.getItem("wantedSources") || "";
        });

        return {
            username,
            chatId,
            subscriptionStatus,
            subscriptionEndDate,
            formattedEndDate,
            formatDate,
            errorMessage,
            messageType,
            clearErrorMessages,
            popupVisible,

            // Import modal exports
            importModalVisible,
            importData,
            importError,
            importLoading,
            importPlaceholder,
            openImportModal,
            closeImportModal,
            importSkins,

            // New function exports
            processItemNamesFromJson,
            cleanItemName,
            validateImportedSkins,
        };
    },
});