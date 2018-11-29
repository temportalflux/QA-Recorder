// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Kismet/BlueprintFunctionLibrary.h"
#include "TimestampBFL.generated.h"

USTRUCT(BlueprintType)
struct QARECORDER_API FTimestamp
{
	GENERATED_BODY()

public:

	int64 timestampInMs;

};

USTRUCT(BlueprintType)
struct FGameplayBookmark
{
	GENERATED_BODY()

public:

	int64 timestampInMs;

	UPROPERTY(BlueprintReadWrite)
		FString comment;

};

/**
 * 
 */
UCLASS()
class QARECORDER_API UTimestampBFL : public UBlueprintFunctionLibrary
{
	GENERATED_BODY()
	
public:

	UFUNCTION(BlueprintCallable)
		static void GetSystemTime(FTimestamp& timestamp);

	static int64 GetSystemTime();

	UFUNCTION(BlueprintCallable)
		static void MakeBookmark(FTimestamp timestampSystemStart, FGameplayBookmark& bookmark);

	UFUNCTION(BlueprintCallable)
		static void SaveBookmarks(TArray<FGameplayBookmark> bookmarks);
	
	UFUNCTION(BlueprintCallable)
		static bool GetCommandLineArgStrDefault(FString key, FString defaultValue, FString& value);

	UFUNCTION(BlueprintCallable)
		static bool GetCommandLineArgBoolDefault(FString key, bool defaultValue, bool& value);
	
	UFUNCTION(BlueprintCallable)
		static bool GetCommandLineArgIntDefault(FString key, int32 defaultValue, int32& value);

	UFUNCTION(BlueprintCallable)
		static void GetBookmarkOutputFilePath(FString& value);

	UFUNCTION(BlueprintCallable)
		static void GetBookmarkSystemTimeOffset(FTimestamp systemStart, FTimestamp& offset);

};
