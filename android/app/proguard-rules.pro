# Add project specific ProGuard rules here.
# http://developer.android.com/guide/developing/tools/proguard.html

# Conservar números de línea para depurar trazas de error.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Capacitor: mantener plugins y bridge (reflexión sobre JS).
-keep class com.getcapacitor.** { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.CapacitorPlugin <methods>;
}
-keepclassmembers class * {
    @com.getcapacitor.PluginMethod <methods>;
}

# WebView JS interfaces (puentes nativos de plugins).
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Conservar nombres de modelos/DTO accedidos vía reflexión si los hubiera.
-keep class cr.bovweight.app.** { *; }
