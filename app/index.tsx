import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useVideoPlayer, VideoView } from "expo-video";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as DeviceSafeAreaView } from "react-native-safe-area-context";

type LibraryVideo = {
  id: string;
  uri: string;
  name: string;
  size?: number;
};

const colors = {
  background: "#0D1419",
  surface: "#151F25",
  surfaceRaised: "#1C292F",
  border: "#29383E",
  text: "#F2F4EC",
  muted: "#99A7A4",
  accent: "#C7F36B",
  accentText: "#18210D",
};

function formatFileSize(size?: number) {
  if (!size) return "Video";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function VideoPlayerModal({
  video,
  onClose,
}: {
  video: LibraryVideo;
  onClose: () => void;
}) {
  const player = useVideoPlayer(video.uri, (videoPlayer) => {
    videoPlayer.play();
  });

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      visible
    >
      <DeviceSafeAreaView style={styles.playerScreen}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.background}
        />
        <View style={styles.playerHeader}>
          <Pressable
            accessibilityLabel="Close video player"
            accessibilityRole="button"
            hitSlop={12}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Feather color={colors.text} name="arrow-left" size={22} />
          </Pressable>
          <Text numberOfLines={1} style={styles.playerTitle}>
            {video.name}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <VideoView
          contentFit="contain"
          nativeControls
          player={player}
          style={styles.videoView}
        />
        <View style={styles.playerFooter}>
          <Text numberOfLines={2} style={styles.playerFooterTitle}>
            {video.name}
          </Text>
          <Text style={styles.playerFooterMeta}>
            {formatFileSize(video.size)}
          </Text>
        </View>
      </DeviceSafeAreaView>
    </Modal>
  );
}

export default function Vidora() {
  const [videos, setVideos] = useState<LibraryVideo[]>([]);
  const [search, setSearch] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<LibraryVideo | null>(null);

  const filteredVideos = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return videos;
    return videos.filter((video) =>
      video.name.toLocaleLowerCase().includes(query),
    );
  }, [search, videos]);

  async function importVideos() {
    setIsImporting(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled) return;

      const importedVideos = result.assets.map((asset) => ({
        id: asset.uri,
        uri: asset.uri,
        name: asset.name,
        size: asset.size,
      }));

      setVideos((currentVideos) => {
        const existingIds = new Set(currentVideos.map((video) => video.id));
        return [
          ...currentVideos,
          ...importedVideos.filter((video) => !existingIds.has(video.id)),
        ];
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Please try importing your video again.";
      Alert.alert("Couldn't import videos", message);
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <DeviceSafeAreaView style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <View style={styles.header}>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Feather color={colors.accentText} name="play" size={17} />
          </View>
          <Text style={styles.brandName}>vidora</Text>
        </View>
        <View style={styles.noAdsBadge}>
          <View style={styles.noAdsDot} />
          <Text style={styles.noAdsText}>NO ADS. EVER.</Text>
        </View>
      </View>

      <FlatList
        contentContainerStyle={styles.content}
        data={filteredVideos}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          search ? (
            <View style={styles.searchEmpty}>
              <Feather color={colors.muted} name="search" size={25} />
              <Text style={styles.emptyTitle}>No videos found</Text>
              <Text style={styles.emptyBody}>
                Try another title or clear your search.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyArtwork}>
                <View style={styles.artworkTile}>
                  <Feather color={colors.accent} name="film" size={31} />
                </View>
                <View style={styles.artworkPlay}>
                  <Feather color={colors.accentText} name="play" size={16} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>Make yourself at home.</Text>
              <Text style={styles.emptyBody}>
                Add videos from your device and enjoy them without ads, noise,
                or distractions.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={isImporting}
                onPress={importVideos}
                style={({ pressed }) => [
                  styles.emptyButton,
                  pressed && styles.buttonPressed,
                  isImporting && styles.buttonDisabled,
                ]}
              >
                {isImporting ? (
                  <ActivityIndicator color={colors.accentText} />
                ) : (
                  <>
                    <Feather color={colors.accentText} name="plus" size={18} />
                    <Text style={styles.emptyButtonText}>
                      Add your first video
                    </Text>
                  </>
                )}
              </Pressable>
              <Text style={styles.privacyNote}>
                YOUR FILES STAY ON YOUR DEVICE
              </Text>
            </View>
          )
        }
        ListHeaderComponent={
          <View>
            <View style={styles.intro}>
              <Text style={styles.eyebrow}>YOUR SPACE, YOUR RULES</Text>
              <Text style={styles.heading}>Your library.</Text>
              <Text style={styles.subtitle}>
                Just your videos. Nothing getting in the way.
              </Text>
            </View>
            <View style={styles.libraryHeading}>
              <View>
                <Text style={styles.sectionTitle}>All videos</Text>
                <Text style={styles.videoCount}>
                  {videos.length} {videos.length === 1 ? "video" : "videos"}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Add videos"
                accessibilityRole="button"
                disabled={isImporting}
                onPress={importVideos}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.buttonPressed,
                  isImporting && styles.buttonDisabled,
                ]}
              >
                {isImporting ? (
                  <ActivityIndicator color={colors.accentText} size="small" />
                ) : (
                  <Feather color={colors.accentText} name="plus" size={19} />
                )}
              </Pressable>
            </View>
            <View style={styles.searchBox}>
              <Feather color={colors.muted} name="search" size={17} />
              <TextInput
                accessibilityLabel="Search videos"
                onChangeText={setSearch}
                placeholder="Search your videos"
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                selectionColor={colors.accent}
                style={styles.searchInput}
                value={search}
              />
              {search.length > 0 && (
                <Pressable
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  hitSlop={8}
                  onPress={() => setSearch("")}
                >
                  <Feather color={colors.muted} name="x-circle" size={17} />
                </Pressable>
              )}
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            accessibilityLabel={`Play ${item.name}`}
            accessibilityRole="button"
            onPress={() => setPlayingVideo(item)}
            style={({ pressed }) => [
              styles.videoRow,
              pressed && styles.videoRowPressed,
            ]}
          >
            <View
              style={[
                styles.thumbnail,
                index % 3 === 1 && styles.thumbnailAlt,
                index % 3 === 2 && styles.thumbnailWarm,
              ]}
            >
              <Feather color={colors.accent} name="film" size={23} />
              <View style={styles.thumbnailPlay}>
                <Feather color={colors.text} name="play" size={11} />
              </View>
            </View>
            <View style={styles.videoDetails}>
              <Text numberOfLines={1} style={styles.videoName}>
                {item.name}
              </Text>
              <Text style={styles.videoMeta}>{formatFileSize(item.size)}</Text>
            </View>
            <Feather color={colors.muted} name="more-vertical" size={19} />
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
      {playingVideo && (
        <VideoPlayerModal
          onClose={() => setPlayingVideo(null)}
          video={playingVideo}
        />
      )}
    </DeviceSafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 64,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandMark: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  noAdsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  noAdsDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  noAdsText: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  intro: {
    paddingTop: 32,
    paddingBottom: 30,
  },
  eyebrow: {
    color: colors.accent,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.8,
    marginBottom: 12,
  },
  heading: {
    color: colors.text,
    fontSize: 35,
    fontWeight: "700",
    letterSpacing: -1.5,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
  },
  libraryHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  videoCount: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  searchBox: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 14,
    marginBottom: 17,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 12,
  },
  videoRow: {
    minHeight: 82,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingVertical: 12,
  },
  videoRowPressed: {
    opacity: 0.7,
  },
  thumbnail: {
    width: 66,
    height: 58,
    borderRadius: 13,
    backgroundColor: "#233933",
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailAlt: {
    backgroundColor: "#283544",
  },
  thumbnailWarm: {
    backgroundColor: "#3A3027",
  },
  thumbnailPlay: {
    position: "absolute",
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#0D1419D9",
    alignItems: "center",
    justifyContent: "center",
  },
  videoDetails: {
    flex: 1,
    gap: 5,
  },
  videoName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  videoMeta: {
    color: colors.muted,
    fontSize: 12,
  },
  emptyCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    backgroundColor: colors.surface,
    paddingHorizontal: 25,
    paddingTop: 34,
    paddingBottom: 26,
    marginTop: 9,
  },
  emptyArtwork: {
    width: 90,
    height: 82,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 21,
  },
  artworkTile: {
    width: 70,
    height: 62,
    borderRadius: 20,
    backgroundColor: colors.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-8deg" }],
  },
  artworkPlay: {
    position: "absolute",
    right: 2,
    bottom: 1,
    width: 31,
    height: 31,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  emptyBody: {
    maxWidth: 290,
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
  },
  emptyButton: {
    minHeight: 48,
    width: "100%",
    borderRadius: 15,
    backgroundColor: colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 23,
  },
  emptyButtonText: {
    color: colors.accentText,
    fontSize: 14,
    fontWeight: "700",
  },
  privacyNote: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.4,
    marginTop: 19,
  },
  searchEmpty: {
    alignItems: "center",
    paddingTop: 48,
  },
  playerScreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  playerHeader: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    paddingHorizontal: 18,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  playerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 12,
  },
  videoView: {
    flex: 1,
    backgroundColor: "#000000",
  },
  playerFooter: {
    paddingHorizontal: 22,
    paddingVertical: 19,
    gap: 5,
  },
  playerFooterTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  playerFooterMeta: {
    color: colors.muted,
    fontSize: 12,
  },
});
