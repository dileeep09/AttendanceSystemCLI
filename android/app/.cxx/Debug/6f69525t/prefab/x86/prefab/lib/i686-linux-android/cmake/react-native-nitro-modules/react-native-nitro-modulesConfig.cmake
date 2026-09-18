if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "/Users/pentaminds_mac01/Desktop/AttendanceSystemCLI/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/Debug/533a5m6d/obj/x86/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/pentaminds_mac01/Desktop/AttendanceSystemCLI/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

